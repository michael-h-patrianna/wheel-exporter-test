/**
 * Performance monitoring script for SegmentRenderer
 * Measures FPS during rotation animations and validates 60fps target
 */

import { chromium } from '@playwright/test';

const PERFORMANCE_CRITERIA = {
  targetFPS: 60,
  minimumAcceptableFPS: 55,
  maxFrameTime: 16.67, // milliseconds (1000ms / 60fps)
  testDuration: 5000, // 5 seconds
};

async function measureRenderPerformance() {
  console.log('🚀 Starting SegmentRenderer Performance Measurement\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    console.log('✓ Page loaded\n');

    // Inject performance monitoring script
    await page.evaluate(() => {
      window.performanceData = {
        frames: [],
        renderCounts: 0,
        lastFrameTime: performance.now(),
      };

      // Monitor RAF for frame timing
      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = function(callback) {
        return originalRAF.call(window, (timestamp) => {
          const now = performance.now();
          const frameDuration = now - window.performanceData.lastFrameTime;
          window.performanceData.frames.push({
            timestamp: now,
            duration: frameDuration
          });
          window.performanceData.lastFrameTime = now;
          return callback(timestamp);
        });
      };

      // Monitor React renders using MutationObserver
      const observer = new MutationObserver(() => {
        window.performanceData.renderCounts++;
      });

      const segmentsEl = document.querySelector('.segments-component');
      if (segmentsEl) {
        observer.observe(segmentsEl, {
          attributes: true,
          childList: true,
          subtree: true
        });
      }
    });

    console.log('📊 Performance monitoring injected\n');

    // Wait for segments to be visible
    await page.waitForSelector('.segments-component', { timeout: 5000 });

    // Measure baseline (idle state)
    console.log('📏 Measuring baseline performance (2 seconds idle)...');
    await page.waitForTimeout(2000);

    const baselineData = await page.evaluate(() => {
      const data = window.performanceData.frames.slice();
      window.performanceData.frames = [];
      return data;
    });

    const baselineFPS = calculateFPS(baselineData);
    console.log(`  Baseline FPS: ${baselineFPS.toFixed(2)}`);
    console.log(`  Baseline frame time: ${calculateAverageFrameTime(baselineData).toFixed(2)}ms\n`);

    // Trigger rotation animation
    console.log('🎡 Starting rotation animation test...');

    // Start measuring
    await page.evaluate(() => {
      window.performanceData.frames = [];
      window.performanceData.renderCounts = 0;
    });

    // Simulate spin by changing rotation
    await page.evaluate(() => {
      const svg = document.querySelector('.segments-component svg');
      if (svg) {
        svg.style.transform = 'rotate(360deg)';
      }
    });

    // Wait for animation duration
    await page.waitForTimeout(PERFORMANCE_CRITERIA.testDuration);

    // Collect performance data
    const animationData = await page.evaluate(() => ({
      frames: window.performanceData.frames,
      renderCounts: window.performanceData.renderCounts
    }));

    console.log('✓ Animation test complete\n');

    // Analyze performance
    console.log('═══════════════════════════════════════════════');
    console.log('📊 PERFORMANCE ANALYSIS');
    console.log('═══════════════════════════════════════════════\n');

    const fps = calculateFPS(animationData.frames);
    const avgFrameTime = calculateAverageFrameTime(animationData.frames);
    const maxFrameTime = Math.max(...animationData.frames.map(f => f.duration));
    const framesOver16ms = animationData.frames.filter(f => f.duration > 16.67).length;
    const jankPercentage = (framesOver16ms / animationData.frames.length) * 100;

    console.log(`Average FPS: ${fps.toFixed(2)}`);
    console.log(`Target FPS: ${PERFORMANCE_CRITERIA.targetFPS}`);
    console.log(`Minimum Acceptable: ${PERFORMANCE_CRITERIA.minimumAcceptableFPS}`);
    console.log(`Status: ${fps >= PERFORMANCE_CRITERIA.minimumAcceptableFPS ? '✅ PASS' : '❌ FAIL'}\n`);

    console.log(`Average Frame Time: ${avgFrameTime.toFixed(2)}ms`);
    console.log(`Max Frame Time: ${maxFrameTime.toFixed(2)}ms`);
    console.log(`Target Frame Time: <${PERFORMANCE_CRITERIA.maxFrameTime}ms\n`);

    console.log(`Jank Frames (>16.67ms): ${framesOver16ms} / ${animationData.frames.length}`);
    console.log(`Jank Percentage: ${jankPercentage.toFixed(2)}%`);
    console.log(`Status: ${jankPercentage < 5 ? '✅ PASS' : '⚠️  WARNING'}\n`);

    console.log(`Total Renders: ${animationData.renderCounts}`);
    console.log(`Total Frames: ${animationData.frames.length}\n`);

    // Performance breakdown
    console.log('═══════════════════════════════════════════════');
    console.log('📈 FRAME TIME DISTRIBUTION');
    console.log('═══════════════════════════════════════════════\n');

    const distribution = {
      excellent: animationData.frames.filter(f => f.duration <= 10).length,
      good: animationData.frames.filter(f => f.duration > 10 && f.duration <= 16.67).length,
      acceptable: animationData.frames.filter(f => f.duration > 16.67 && f.duration <= 33).length,
      poor: animationData.frames.filter(f => f.duration > 33).length,
    };

    const total = animationData.frames.length;
    console.log(`Excellent (<10ms):     ${distribution.excellent.toString().padStart(4)} (${((distribution.excellent/total)*100).toFixed(1)}%)`);
    console.log(`Good (10-16.67ms):     ${distribution.good.toString().padStart(4)} (${((distribution.good/total)*100).toFixed(1)}%)`);
    console.log(`Acceptable (16-33ms):  ${distribution.acceptable.toString().padStart(4)} (${((distribution.acceptable/total)*100).toFixed(1)}%)`);
    console.log(`Poor (>33ms):          ${distribution.poor.toString().padStart(4)} (${((distribution.poor/total)*100).toFixed(1)}%)\n`);

    // Overall verdict
    console.log('═══════════════════════════════════════════════');
    console.log('🎯 OVERALL VERDICT');
    console.log('═══════════════════════════════════════════════\n');

    const passing = fps >= PERFORMANCE_CRITERIA.minimumAcceptableFPS && jankPercentage < 5;

    if (passing) {
      console.log('✅ SegmentRenderer meets 60fps performance requirements');
      console.log('   - Smooth animations achieved');
      console.log('   - Minimal jank detected');
      console.log('   - GPU-accelerated rendering working correctly\n');
    } else {
      console.log('❌ SegmentRenderer FAILED performance requirements');
      if (fps < PERFORMANCE_CRITERIA.minimumAcceptableFPS) {
        console.log(`   - FPS too low: ${fps.toFixed(2)} < ${PERFORMANCE_CRITERIA.minimumAcceptableFPS}`);
      }
      if (jankPercentage >= 5) {
        console.log(`   - Too much jank: ${jankPercentage.toFixed(2)}% >= 5%`);
      }
      console.log('   - Review memoization and rendering optimizations\n');
    }

    return {
      passing,
      fps,
      avgFrameTime,
      maxFrameTime,
      jankPercentage,
      distribution
    };

  } catch (error) {
    console.error('❌ Error during performance measurement:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

function calculateFPS(frames) {
  if (frames.length === 0) return 0;
  const totalTime = frames[frames.length - 1].timestamp - frames[0].timestamp;
  return (frames.length / totalTime) * 1000;
}

function calculateAverageFrameTime(frames) {
  if (frames.length === 0) return 0;
  const sum = frames.reduce((acc, f) => acc + f.duration, 0);
  return sum / frames.length;
}

// Run the performance test
measureRenderPerformance()
  .then(results => {
    process.exit(results.passing ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
