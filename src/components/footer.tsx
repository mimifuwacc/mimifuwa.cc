"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { memo } from "react";
import { FaEnvelope, FaGithub, FaTwitter } from "react-icons/fa6";

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterProps {
  year?: number;
  author?: string;
  showSocialLinks?: boolean;
  footerLinks?: FooterLink[];
}

const footerStyles = cva("bg-slate-900 border-t border-slate-700");

const containerStyles = cva("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8");

const linkStyles = cva(
  "text-slate-300 hover:text-cyan-400 transition-colors duration-200",
);

const socialLinkStyles = cva(
  "text-slate-400 hover:text-cyan-400 transition-colors duration-200 transform hover:scale-110",
);

const FooterLink = memo(function FooterLink({ link }: { link: FooterLink }) {
  return (
    <Link href={link.href} className={linkStyles()}>
      {link.label}
    </Link>
  );
});

const SocialLink = memo(function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={socialLinkStyles()}
      aria-label={label}
    >
      <span className="text-xl">{icon}</span>
    </a>
  );
});

const Footer = memo(function Footer({
  year = new Date().getFullYear(),
  author = "mimifuwacc",
  showSocialLinks = true,
  footerLinks = [
    { href: "/", label: "ホーム" },
    { href: "/blogs", label: "ブログ" },
    { href: "/links", label: "相互リンク" },
  ],
}: FooterProps) {
  const socialLinks = [
    {
      href: "https://github.com/mimifuwa",
      icon: <FaGithub />,
      label: "GitHub",
    },
    {
      href: "https://x.com/mimifuwa_cc",
      icon: <FaTwitter />,
      label: "X (Twitter)",
    },
    {
      href: "mailto:mail@mimifuwa.cc",
      icon: <FaEnvelope />,
      label: "Email",
    },
  ];

  return (
    <footer className={footerStyles()}>
      <div className={containerStyles()}>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* 左側：フッターリンク */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
            {footerLinks.map((link) => (
              <FooterLink key={link.href} link={link} />
            ))}
          </div>

          {/* 中央：コピーライト */}
          <div className="text-center md:text-center">
            <p className="text-slate-300 text-sm">
              © {year} {author}
            </p>
          </div>

          {/* 右側：SNSリンク */}
          {showSocialLinks && (
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <SocialLink
                  key={social.href}
                  href={social.href}
                  icon={social.icon}
                  label={social.label}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
});

export default Footer;
