/**
 * SEO 元数据回填脚本
 * 
 * 使用方法：
 *   node scripts/generate-seo.cjs [batchSize]
 * 
 * 这个脚本会调用 /api/cron/generate-seo-metadata 接口，为缺少 SEO 元数据的文章生成标题和描述。
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET || "";
const BATCH_SIZE = process.argv[2] || "25";

async function generateSeo() {
  console.log(`[${new Date().toISOString()}] 开始 SEO 元数据回填...`);

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (CRON_SECRET) {
      headers["Authorization"] = `Bearer ${CRON_SECRET}`;
    }

    const response = await fetch(`${SITE_URL}/api/cron/generate-seo-metadata?batchSize=${BATCH_SIZE}`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[完成] 扫描 ${data.scanned} 篇，更新 ${data.updated} 篇，失败 ${data.failed} 篇`);
  } catch (error) {
    console.error(`[错误] SEO 回填失败:`, error.message);
  }
}

generateSeo();
