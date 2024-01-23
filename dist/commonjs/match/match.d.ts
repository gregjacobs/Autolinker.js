import { EmailMatch } from './email-match';
import { HashtagMatch } from './hashtag-match';
import { MentionMatch } from './mention-match';
import { PhoneMatch } from './phone-match';
import { UrlMatch } from './url-match';
export type Match = EmailMatch | HashtagMatch | MentionMatch | PhoneMatch | UrlMatch;
export type MatchType = 'email' | 'hashtag' | 'mention' | 'phone' | 'url';
