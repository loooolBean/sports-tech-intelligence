/**
 * RSS 采集脚本
 * 
 * 使用方法：
 *   node scripts/ingest-rss.cjs
 * 
 * 这个脚本会调用 /api/cron/ingest-rss 接口，采集所有活跃的 RSS 源。
 * 可以配合 Windows 任务计划程序或 Linux cron 定时执行。
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET || "";

async function ingestRss() {
  console.log(`[${new Date().toISOString()}] 开始 RSS 采集...`);

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (CRON_SECRET) {
      headers["Authorization"] = `Bearer ${CRON_SECRET}`;
    }

    const response = await fetch(`${SITE_URL}/api/cron/ingest-rss`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[完成] ${data.message}`);

    if (data.results && data.results.length > 0) {
      console.log("\n采集结果：");
      for (const result of data.results) {
        if (result.error) {
          console.log(`  ❌ ${result.source}: ${result.error}`);
        } else {
          console.log(`  ✅ ${result.source}: 抓取 ${result.fetched} 篇，新增 ${result.created} 篇，重复 ${result.duplicates} 篇，失败 ${result.failed} 篇`);
        }
      }
    }
  } catch (error) {
    console.error(`[错误] 采集失败:`, error.message);
  }
}

ingestRss();
