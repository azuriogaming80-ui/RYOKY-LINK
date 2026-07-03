// src/types/item.ts
// (ajoute ces interfaces à ton fichier existant)

export interface BaseItemDto {
  id: string;
  name: string;
  type: 'Movie' | 'Series' | 'Season' | 'Episode' | 'BoxSet' | 'MusicAlbum' | 'Audio' | 'Book';
  overview?: string;
  year?: number;
  premiereDate?: string;
  officialRating?: string;
  communityRating?: number;
  criticRating?: number;
  runTimeTicks?: number;
  productionYear?: number;
  indexNumber?: number;        // Episode number
  parentIndexNumber?: number;  // Season number
  seriesName?: string;
  seasonName?: string;
  imageTags?: Record<string, string>;
  backdropImageTags?: string[];
  primaryImageAspectRatio?: number;
  userData?: UserItemDataDto;
  mediaType?: 'Video' | 'Audio';
  collectionType?: string;
  // === AJOUTS PHASE 3 ===
  path?: string;
  genres?: string[];
  tags?: string[];
  studios?: NameGuidPair[];
  people?: BaseItemPerson[];
  seriesId?: string;
  seasonId?: string;
  parentId?: string;
  childCount?: number;
  // Pour les séries : nombre de saisons
  status?: string; // "Continuing", "Ended", etc.
  airDays?: string[];
  airTime?: string;
}

export interface UserItemDataDto {
  playbackPositionTicks?: number;
  playCount?: number;
  isFavorite?: boolean;
  likes?: boolean;
  lastPlayedDate?: string;
  played?: boolean;
  key?: string;
  itemId?: string;
}

export interface MediaStream {
  index: number;
  type: 'Video' | 'Audio' | 'Subtitle';
  codec?: string;
  language?: string;
  displayTitle?: string;
  isDefault?: boolean;
  isExternal?: boolean;
  path?: string;
}

export interface MediaSourceInfo {
  id: string;
  protocol?: string;
  path?: string;
  type?: string;
  container?: string;
  size?: number;
  name?: string;
  isRemote?: boolean;
  hasMixedProtocols?: boolean;
  runTimeTicks?: number;
  supportsTranscoding?: boolean;
  supportsDirectStream?: boolean;
  supportsDirectPlay?: boolean;
  isInfiniteStream?: boolean;
  requiresOpening?: boolean;
  requiresClosing?: boolean;
  requiresLooping?: boolean;
  supportsProbing?: boolean;
  videoType?: string;
  isoType?: string;
  video3DFormat?: string;
  mediaStreams?: MediaStream[];
  mediaAttachments?: any[];
  formats?: string[];
  bitrate?: number;
  timestamp?: string;
  requiredHttpHeaders?: Record<string, string>;
  transcodingUrl?: string;
  transcodingSubProtocol?: string;
  transcodingContainer?: string;
  analyzeDurationMs?: number;
  readAtNativeFramerate?: boolean;
  itemId?: string;
}

export interface MediaSegment {
  id: string;
  itemId: string;
  type: 'Intro' | 'Outro' | 'Preview' | 'Recap' | 'Commercial';
  startTicks: number;
  endTicks: number;
}

// === NOUVEAU : Personnes (casting) ===
export interface BaseItemPerson {
  name: string;
  id?: string;
  role?: string;
  type: 'Actor' | 'Director' | 'Writer' | 'Producer' | 'Composer' | 'GuestStar' | string;
  primaryImageTag?: string;
  imageTags?: Record<string, string>;
}

export interface NameGuidPair {
  name: string;
  id?: string;
}

// === NOUVEAU : Saison ===
export interface SeasonDto extends BaseItemDto {
  indexNumber: number; // numéro de saison
  seriesName: string;
  seriesId: string;
}

// === NOUVEAU : Épisode ===
export interface EpisodeDto extends BaseItemDto {
  indexNumber: number;
  parentIndexNumber: number;
  seriesName: string;
  seriesId: string;
  seasonId: string;
  seasonName: string;
}