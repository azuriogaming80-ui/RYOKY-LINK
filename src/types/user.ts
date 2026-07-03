export interface UserDto {
  Id: string
  Name: string
  ServerId?: string
  PrimaryImageTag?: string
  Configuration?: UserConfiguration
}

export interface UserConfiguration {
  AudioLanguagePreference?: string
  SubtitleLanguagePreference?: string
  PlayDefaultAudioTrack?: boolean
  DisplayMissingEpisodes?: boolean
}

export interface AuthenticationResult {
  AccessToken: string
  User: UserDto
  ServerId?: string
}