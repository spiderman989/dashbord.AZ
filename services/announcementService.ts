import { announcements } from "@/data/announcements";
import { createMockRepository } from "./mockRepository";
export const announcementService = createMockRepository("announcements", announcements);
export const getAnnouncements = announcementService.list;
