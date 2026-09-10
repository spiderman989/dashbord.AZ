import { gallery } from "@/data/gallery";
import { createMockRepository } from "./mockRepository";
export const galleryService = createMockRepository("gallery", gallery);
export const getGallery = galleryService.list;
