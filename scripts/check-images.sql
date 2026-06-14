SELECT
  COUNT(*) as total,
  COUNT(image_url) as with_image,
  COUNT(*) - COUNT(image_url) as without_image
FROM articles
WHERE status = 'PUBLISHED' AND duplicate_of_article_id IS NULL;
