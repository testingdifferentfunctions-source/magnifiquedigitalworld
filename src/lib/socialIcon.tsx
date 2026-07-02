import {
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Github,
  Send,
  Music2,
  Cloud,
  Globe,
  Link as LinkIcon,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';

export const getSocialIcon = (platform: string): LucideIcon => {
  const p = platform.trim().toLowerCase();
  if (p.includes('mail') || p.includes('email') || p.includes('@')) return Mail;
  if (p.includes('instagram')) return Instagram;
  if (p.includes('facebook')) return Facebook;
  if (p === 'x' || p.includes('twitter')) return Twitter;
  if (p.includes('linkedin')) return Linkedin;
  if (p.includes('youtube')) return Youtube;
  if (p.includes('github')) return Github;
  if (p.includes('telegram')) return Send;
  if (p.includes('tiktok')) return Music2;
  if (p.includes('bluesky') || p.includes('bsky')) return Cloud;
  if (p.includes('whatsapp') || p.includes('messenger') || p.includes('discord')) return MessageCircle;
  if (p.includes('website') || p.includes('site') || p.includes('web')) return Globe;
  return LinkIcon;
};

export const isMailto = (url: string) => url.trim().toLowerCase().startsWith('mailto:');
