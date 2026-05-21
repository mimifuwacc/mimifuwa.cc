import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaGithub, FaTwitter } from "react-icons/fa6";
import { Check, Copy } from "lucide-react";
import { sessionId } from "@/lib/session-id";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blog" },
  { href: "/links", label: "Links" },
];

const socialLinks = [
  { href: "https://github.com/mimifuwa", icon: <FaGithub />, label: "GitHub" },
  { href: "https://x.com/mimifuwa_cc", icon: <FaTwitter />, label: "X" },
  { href: "mailto:mail@mimifuwa.cc", icon: <FaEnvelope />, label: "Email" },
];

export default function Footer() {
  const uuid = sessionId;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
          {/* ブランド */}
          <div>
            <Link to="/" className="text-lg font-bold text-primary">
              mimifuwa.cc
            </Link>
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1 cursor-pointer group"
            >
              {uuid}
              {copied
                ? <Check className="size-3 text-primary shrink-0" />
                : <Copy className="size-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              }
            </button>
          </div>

          {/* ナビ + ソーシャル */}
          <div className="flex flex-col sm:items-end gap-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} mimifuwa.cc
        </p>
      </div>
    </footer>
  );
}
