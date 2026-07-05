// src/services/jellyfin-api.ts
import axios, { AxiosInstance } from 'axios';
import { mapJellyfinItem, mapJellyfinItems, mapJellyfinItemSingle } from '@/utils/mapper';
import type { MediaSegment } from '@/types/item';

// 🛡️ Fonction de secours pour générer un UUID compatible avec les contextes non-sécurisés (HTTP local sur mobile)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class JellyfinApiService {
  private client: AxiosInstance;
  private _baseUrl: string = '';
  private _token: string = '';
  private _userId: string = '';

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor token
    this.client.interceptors.request.use((config) => {
      if (this._token) {
        config.headers['X-Emby-Token'] = this._token;
      }
      return config;
    });

    // Interceptor 401 → auto logout
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this._token = '';
          this._userId = '';
          localStorage.removeItem('jellyfin_token');
          localStorage.removeItem('jellyfin_userid');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  get token(): string {
    return this._token;
  }

  setServer(url: string) {
    this._baseUrl = url.replace(/\/$/, '');
  }

  setToken(token: string) {
    this._token = token;
  }

  setUserId(id: string) {
    this._userId = id;
  }

  // ========== AUTH ==========
  async getPublicUsers(): Promise<any> {
    const data = (await this.client.get(`${this._baseUrl}/Users/Public`)).data;
    return mapJellyfinItem(data) || [];
  }

  async authenticateByName(username: string, password: string): Promise<any> {
    // 🛡️ Utilisation du generateUUID() fallback pour éviter le crash sur mobile
    const deviceId = localStorage.getItem('jellyfin_deviceid') || generateUUID();
    localStorage.setItem('jellyfin_deviceid', deviceId);

    const auth = `MediaBrowser Client="RyokyLink",Device="Browser",DeviceId="${deviceId}",Version="1.0.0"`;

    const data = (await this.client.post(
      `${this._baseUrl}/Users/AuthenticateByName`,
      { Username: username, Pw: password },
      { headers: { 'X-Emby-Authorization': auth } }
    )).data;

    return mapJellyfinItem(data);
  }

  // ========== USER ==========
  async getUser(userId: string): Promise<any> {
    const data = (await this.client.get(`${this._baseUrl}/Users/${userId}`)).data;
    return mapJellyfinItem(data);
  }

  async updateUserConfiguration(userId: string, config: any): Promise<void> {
    await this.client.post(`${this._baseUrl}/Users/${userId}/Configuration`, config);
  }

  // ========== VIEWS / LIBRARIES ==========
  async getViews(userId: string): Promise<any[]> {
    const data = (await this.client.get(`${this._baseUrl}/Users/${userId}/Views`)).data;
    return mapJellyfinItems(data);
  }

  // ========== ITEMS (générique) ==========
  async getItems(params: {
    userId: string;
    parentId?: string;
    includeItemTypes?: string[];
    mediaTypes?: string[];
    recursive?: boolean;
    sortBy?: string;
    sortOrder?: 'Ascending' | 'Descending';
    filters?: string;
    limit?: number;
    startIndex?: number;
    fields?: string[];
    imageTypeLimit?: number;
    enableImageTypes?: string[];
    searchTerm?: string;
  }): Promise<any> {
    const query = new URLSearchParams();
    query.append('UserId', params.userId);

    if (params.parentId) query.append('ParentId', params.parentId);
    if (params.includeItemTypes?.length) query.append('IncludeItemTypes', params.includeItemTypes.join(','));
    if (params.mediaTypes?.length) query.append('MediaTypes', params.mediaTypes.join(','));
    if (params.recursive !== undefined) query.append('Recursive', String(params.recursive));
    if (params.sortBy) query.append('SortBy', params.sortBy);
    if (params.sortOrder) query.append('SortOrder', params.sortOrder);
    if (params.filters) query.append('Filters', params.filters);
    if (params.limit !== undefined) query.append('Limit', String(params.limit));
    if (params.startIndex !== undefined) query.append('startIndex', String(params.startIndex));
    if (params.fields?.length) query.append('Fields', params.fields.join(','));
    if (params.imageTypeLimit !== undefined) query.append('ImageTypeLimit', String(params.imageTypeLimit));
    if (params.enableImageTypes?.length) query.append('EnableImageTypes', params.enableImageTypes.join(','));
    if (params.searchTerm) query.append('SearchTerm', params.searchTerm);

    const data = (await this.client.get(`${this._baseUrl}/Items?${query.toString()}`)).data;
    return mapJellyfinItem(data); 
  }

  // ========== ITEM DETAIL ==========
  async getItem(userId: string, itemId: string): Promise<any> {
    const fields = [
      'PrimaryImageAspectRatio',
      'CanDelete',
      'MediaSourceCount',
      'Overview',
      'Genres',
      'Studios',
      'People',
      'Status',
      'AirDays',
      'AirTime',
      'Path',
      'Tags',
      'ChildCount',
      'DateCreated',
      'IndexNumber',
      'ParentIndexNumber',
      'SeriesName',
      'SeasonName',
      'SeriesId',
      'SeasonId',
    ].join(',');

    const data = (await this.client.get(
      `${this._baseUrl}/Users/${userId}/Items/${itemId}?Fields=${fields}`
    )).data;

    return mapJellyfinItemSingle(data);
  }

  // ========== SEASONS ==========
  async getSeasons(seriesId: string, userId: string): Promise<any[]> {
    const query = new URLSearchParams();
    query.append('UserId', userId);
    query.append('Fields', 'PrimaryImageAspectRatio,BasicSyncInfo,CanDelete,MediaSourceCount,IndexNumber');
    query.append('ImageTypeLimit', '1');
    query.append('EnableImageTypes', 'Primary,Backdrop,Thumb');

    const data = (await this.client.get(
      `${this._baseUrl}/Shows/${seriesId}/Seasons?${query.toString()}`
    )).data;

    return mapJellyfinItems(data);
  }

  // ========== EPISODES ==========
  async getEpisodes(seriesId: string, seasonId: string, userId: string): Promise<any[]> {
    const query = new URLSearchParams();
    query.append('UserId', userId);
    query.append('SeasonId', seasonId);
    query.append('Fields', 'PrimaryImageAspectRatio,CanDelete,MediaSourceCount,Overview,IndexNumber,ParentIndexNumber,DateCreated');
    query.append('ImageTypeLimit', '1');
    query.append('EnableImageTypes', 'Primary,Backdrop,Thumb');

    const data = (await this.client.get(
      `${this._baseUrl}/Shows/${seriesId}/Episodes?${query.toString()}`
    )).data;

    return mapJellyfinItems(data);
  }

  // ========== SIMILAR ITEMS ==========
  async getSimilarItems(userId: string, itemId: string, limit: number = 12): Promise<any[]> {
    const query = new URLSearchParams();
    query.append('UserId', userId);
    query.append('Limit', String(limit));
    query.append('Fields', 'PrimaryImageAspectRatio,CanDelete,MediaSourceCount,BasicSyncInfo');
    query.append('ImageTypeLimit', '1');
    query.append('EnableImageTypes', 'Primary,Backdrop,Thumb');

    const data = (await this.client.get(
      `${this._baseUrl}/Items/${itemId}/Similar?${query.toString()}`
    )).data;

    return mapJellyfinItems(data);
  }

  // ========== DASHBOARD ==========
  async getResumeItems(userId: string, mediaType: 'Video' | 'Audio' | 'Book'): Promise<any[]> {
    const data = await this.getItems({
      userId,
      mediaTypes: [mediaType],
      filters: 'IsResumable',
      sortBy: 'DatePlayed',
      sortOrder: 'Descending',
      limit: 20,
      recursive: true,
      fields: ['PrimaryImageAspectRatio', 'BasicSyncInfo', 'CanDelete', 'MediaSourceCount'],
      imageTypeLimit: 1,
      enableImageTypes: ['Primary', 'Backdrop', 'Thumb'],
    });
    // 🛡️ Sécurisation du retour tableau
    return data?.Items || data?.items || [];
  }

  async getNextUp(userId: string, params?: { limit?: number; seriesId?: string; parentId?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    query.append('UserId', userId);
    query.append('Limit', String(params?.limit || 24));
    query.append('Fields', 'PrimaryImageAspectRatio,DateCreated,MediaSourceCount,BasicSyncInfo');

    if (params?.seriesId) query.append('SeriesId', params.seriesId);
    if (params?.parentId) query.append('ParentId', params.parentId);

    const data = (await this.client.get(
      `${this._baseUrl}/Shows/NextUp?${query.toString()}`
    )).data;

    return mapJellyfinItems(data);
  }

  async getRecentlyAdded(userId: string, parentId: string, limit: number = 16): Promise<any[]> {
    const data = await this.getItems({
      userId,
      parentId,
      sortBy: 'DateCreated',
      sortOrder: 'Descending',
      limit,
      recursive: true,
      fields: ['PrimaryImageAspectRatio', 'BasicSyncInfo', 'CanDelete', 'MediaSourceCount'],
      imageTypeLimit: 1,
      enableImageTypes: ['Primary', 'Backdrop', 'Thumb'],
    });
    // 🛡️ Sécurisation du retour tableau
    return data?.Items || data?.items || [];
  }

  // ========== PLAYBACK ==========
  async getPlaybackInfo(itemId: string, userId: string, params?: any): Promise<any> {
    const data = (await this.client.post(
      `${this._baseUrl}/Items/${itemId}/PlaybackInfo?UserId=${userId}`,
      params || {}
    )).data;

    return mapJellyfinItem(data);
  }

  async reportPlaybackProgress(data: {
    itemId: string;
    positionTicks: number;
    isPaused: boolean;
    mediaSourceId?: string;
    playSessionId?: string;
  }): Promise<void> {
    await this.client.post(`${this._baseUrl}/Sessions/Playing/Progress`, {
      ItemId: data.itemId,
      PositionTicks: data.positionTicks,
      IsPaused: data.isPaused,
      MediaSourceId: data.mediaSourceId,
      PlaySessionId: data.playSessionId,
    });
  }

  async reportPlaybackStopped(data: {
    itemId: string;
    positionTicks: number;
    mediaSourceId?: string;
    playSessionId?: string;
  }): Promise<void> {
    await this.client.post(`${this._baseUrl}/Sessions/Playing/Stopped`, {
      ItemId: data.itemId,
      PositionTicks: data.positionTicks,
      MediaSourceId: data.mediaSourceId,
      PlaySessionId: data.playSessionId,
    });
  }

  // ========== IMAGES ==========
  getImageUrl(
    itemId: string,
    imageType: string = 'Primary',
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      tag?: string;
    }
  ): string {
    if (!itemId) return '';
    let url = `${this._baseUrl}/Items/${itemId}/Images/${imageType}`;
    const params = new URLSearchParams();

    // 🔒 Injection du token pour éviter les blocages CORS / Auth sur les balises <img>
    if (this._token) {
      params.append('api_key', this._token);
    }

    if (options?.width) params.append('MaxWidth', String(options.width));
    if (options?.height) params.append('MaxHeight', String(options.height));
    if (options?.quality) params.append('Quality', String(options.quality));
    if (options?.tag) params.append('tag', options.tag);

    if (params.toString()) url += `?${params.toString()}`;
    return url;
  }

  // ========== SEARCH ==========
  async search(userId: string, searchTerm: string, limit: number = 24): Promise<any[]> {
    const query = new URLSearchParams();
    query.append('UserId', userId);
    query.append('searchTerm', searchTerm);
    query.append('Limit', String(limit));
    query.append('Fields', 'PrimaryImageAspectRatio,CanDelete,MediaSourceCount,BasicSyncInfo');
    query.append('ImageTypeLimit', '1');
    query.append('EnableImageTypes', 'Primary,Backdrop,Thumb');

    const data = (await this.client.get(
      `${this._baseUrl}/Items?${query.toString()}`
    )).data;

    return mapJellyfinItems(data);
  }

  // ========== FAVOURITES ==========
  async toggleFavorite(userId: string, itemId: string, isFavorite: boolean): Promise<void> {
    const endpoint = isFavorite ? 'FavoriteItems' : 'FavoriteItems/Delete';
    await this.client.post(`${this._baseUrl}/Users/${userId}/${endpoint}/${itemId}`);
  }

  // ========== MARK PLAYED / UNPLAYED ==========
  async markPlayed(userId: string, itemId: string, played: boolean): Promise<void> {
    const endpoint = played ? 'PlayedItems' : 'PlayedItems/Delete';
    await this.client.post(`${this._baseUrl}/Users/${userId}/${endpoint}/${itemId}`);
  }

  // ========== MEDIA SEGMENTS ==========
  async getMediaSegments(itemId: string): Promise<MediaSegment[]> {
    try {
      const data = await this.client.get(`${this._baseUrl}/Items/${itemId}/MediaSegments`);
      return mapJellyfinItems(data) || [];
    } catch {
      return [];
    }
  }
}

export const jellyfinApi = new JellyfinApiService();