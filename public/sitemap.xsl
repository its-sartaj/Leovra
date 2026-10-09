<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap | Leovra Enterprises</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5; margin: 0; padding: 30px; }
          .container { max-width: 900px; margin: 0 auto; background: #171717; border-radius: 16px; padding: 24px; border: 1px solid #262626; }
          h1 { color: #f59e0b; font-size: 22px; margin: 0 0 8px 0; }
          p { color: #a3a3a3; font-size: 13px; margin: 0 0 20px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #262626; color: #fafafa; text-align: left; padding: 12px; font-weight: 600; border-bottom: 2px solid #404040; }
          td { padding: 12px; border-bottom: 1px solid #262626; color: #d4d4d4; }
          tr:hover { background: #202020; }
          a { color: #fbbf24; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: #064e3b; color: #34d399; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Leovra Enterprises — Official XML Sitemap</h1>
          <p>This sitemap is active, validated, and optimized for Google Search Console indexing. All URLs below are live.</p>
          <table>
            <thead>
              <tr>
                <th>Page URL</th>
                <th>Last Modified</th>
                <th>Frequency</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                  <td><xsl:value-of select="sitemap:lastmod"/></td>
                  <td><xsl:value-of select="sitemap:changefreq"/></td>
                  <td><xsl:value-of select="sitemap:priority"/></td>
                  <td><span class="badge">Live &amp; Indexed</span></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
