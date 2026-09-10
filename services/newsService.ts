import { news } from "@/data/news";
import { createMockRepository } from "./mockRepository";
export const newsService = createMockRepository("news", news);
export const getNews = newsService.list;
export const getNewsById = newsService.get;
