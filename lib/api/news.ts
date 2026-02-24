export interface NewsArticle {
  id: string
  title: string
  description: string
  content: string
  author: string
  publishedAt: string
  urlToImage: string
  source: string
  category: string
  tags: string[]
  url?: string
}

class NewsAPI {
  private baseUrl = "https://cryptonews-api.com/api/v1"
  // Set to true to use mock data, false to try real API (requires API key)
  private useMockData = true

  /**
   * Get financial/crypto news from CryptoNewsAPI or mock data
   * Falls back to mock data if API is unavailable or no API key
   */
  async getFinancialNews(category?: string, limit = 10): Promise<NewsArticle[]> {
    // Try to fetch from real API first (if API key is available)
    const apiKey = process.env.NEXT_PUBLIC_CRYPTO_NEWS_API_KEY
    if (!this.useMockData && apiKey) {
      try {
        const response = await fetch(
          `${this.baseUrl}/news?items=${limit}${category ? `&topic=${category}` : ""}`,
          {
            headers: {
              "x-api-key": apiKey,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.data && Array.isArray(data.data)) {
            return this.transformNewsData(data.data, category, limit)
          }
        }
      } catch (error) {
        console.warn("CryptoNewsAPI unavailable, using mock data:", error)
        // Fall through to mock data
      }
    }

    // Use mock data (default or fallback)
    return this.getMockNews(category, limit)
  }

  /**
   * Transform CryptoNewsAPI response to NewsArticle format
   */
  private transformNewsData(
    articles: any[],
    category?: string,
    limit?: number
  ): NewsArticle[] {
    return articles
      .filter((article) => {
        if (!category) return true
        // Map API categories to our categories
        const categoryMap: Record<string, string> = {
          bitcoin: "cryptocurrency",
          ethereum: "cryptocurrency",
          altcoin: "cryptocurrency",
          defi: "cryptocurrency",
          nft: "cryptocurrency",
          regulation: "markets",
          adoption: "markets",
        }
        const apiCategory = article.topics?.[0]?.toLowerCase() || ""
        return categoryMap[apiCategory] === category || apiCategory === category
      })
      .slice(0, limit || 10)
      .map((article, index) => ({
        id: article.news_url?.split("/").pop() || `external-${index}`,
        title: article.title || "Untitled",
        description: article.text?.substring(0, 200) || "",
        content: article.text || article.description || "",
        author: article.source_name || "Unknown",
        publishedAt: article.date || new Date().toISOString(),
        urlToImage: article.image_url || "",
        source: article.source_name || "Crypto News",
        category: this.mapCategory(article.topics?.[0]) || "cryptocurrency",
        tags: article.topics || [],
        url: article.news_url || "",
      }))
  }

  /**
   * Map API categories to our category system
   */
  private mapCategory(apiCategory?: string): string {
    if (!apiCategory) return "cryptocurrency"
    const category = apiCategory.toLowerCase()
    const categoryMap: Record<string, string> = {
      bitcoin: "cryptocurrency",
      ethereum: "cryptocurrency",
      altcoin: "cryptocurrency",
      defi: "cryptocurrency",
      nft: "cryptocurrency",
      regulation: "markets",
      adoption: "markets",
      trading: "markets",
    }
    return categoryMap[category] || "cryptocurrency"
  }

  /**
   * Get a single news article by ID
   */
  async getNewsById(id: string): Promise<NewsArticle | null> {
    // If it's an external news ID, try to fetch from API
    if (id.startsWith("external-") || !isNaN(Number(id))) {
      try {
        const allNews = await this.getFinancialNews(undefined, 50)
        return allNews.find((article) => article.id === id) || null
      } catch (error) {
        console.error("Error fetching news by ID:", error)
        return null
      }
    }
    return null
  }

  /**
   * Mock news data for fallback
   */
  private getMockNews(category?: string, limit = 10): NewsArticle[] {
    const mockNews: NewsArticle[] = [
      {
        id: "1",
        title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
        description:
          "Bitcoin surged to unprecedented levels as major institutions continue to embrace cryptocurrency investments.",
        content:
          "Bitcoin has reached a new all-time high, driven by increased institutional adoption and growing acceptance of cryptocurrency as a legitimate asset class. Major financial institutions and corporations are increasingly adding Bitcoin to their balance sheets, signaling a shift in how digital assets are perceived in traditional finance.",
        author: "Sarah Johnson",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        // Use existing static asset so the image always loads in dev
        urlToImage: "/globe.svg",
        source: "Crypto Daily",
        category: "cryptocurrency",
        tags: ["bitcoin", "institutional", "adoption"],
      },
      {
        id: "2",
        title: "Federal Reserve Signals Potential Interest Rate Changes",
        description: "The Fed hints at upcoming monetary policy adjustments in response to economic indicators.",
        content:
          "Federal Reserve officials have indicated potential changes to interest rates following recent economic data. The central bank is closely monitoring inflation trends and employment figures to determine the appropriate monetary policy stance.",
        author: "Michael Chen",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        urlToImage: "/window.svg",
        source: "Financial Times",
        category: "markets",
        tags: ["fed", "interest-rates", "monetary-policy"],
      },
      {
        id: "3",
        title: "Gold Prices Surge on Global Economic Uncertainty",
        description: "Precious metals see increased demand as investors seek safe-haven assets.",
        content:
          "Gold prices have surged significantly as global economic uncertainty drives investors toward safe-haven assets. The precious metal has seen strong demand amid concerns about inflation and geopolitical tensions.",
        author: "Emma Rodriguez",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        urlToImage: "/next.svg",
        source: "Commodities Weekly",
        category: "commodities",
        tags: ["gold", "safe-haven", "uncertainty"],
      },
    ]

    if (category) {
      return mockNews.filter((article) => article.category === category).slice(0, limit)
    }

    return mockNews.slice(0, limit)
  }

  // Get trending news
  async getTrendingNews(limit = 5): Promise<NewsArticle[]> {
    const news = await this.getFinancialNews()
    return news.slice(0, limit)
  }
}

export const newsAPI = new NewsAPI()
