import { FaGithub, FaTwitter } from "react-icons/fa";
import { SiZenn } from "react-icons/si";
import { Avatar, AvatarImage } from "@mimifuwacc/ui/components/ui/avatar";
import { LinkButton } from "@mimifuwacc/ui/components/ui/button";
import { Card, CardContent } from "@mimifuwacc/ui/components/ui/card";
import { Separator } from "@mimifuwacc/ui/components/ui/separator";

export default function Profile() {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-muted dark:border-foreground/20 shrink-0">
            <AvatarImage src="/mimifuwacc.png" alt="mimifuwacc" />
          </Avatar>
          <div>
            <h3 className="text-lg font-bold leading-tight">
              mimifuwacc
              <span className="text-sm font-normal ml-2 text-muted-foreground">ˈmiːmi</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              電気通信大学 情報理工学域
              <br />
              コンピュータサイエンスプログラム
            </p>
          </div>
        </div>
        <Separator className="mb-4" />
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Webアプリケーションエンジニア．大学ではアセンブリの形式検証に取り組んでいます．
          ヰ世界情緒とラノベが好き．
        </p>
        <div className="flex flex-wrap gap-2">
          <LinkButton
            size="sm"
            variant="secondary"
            href="https://github.com/mimifuwacc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithub /> GitHub
          </LinkButton>
          <LinkButton
            size="sm"
            variant="secondary"
            href="https://twitter.com/mimifuwacc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <FaTwitter /> Twitter
          </LinkButton>
          <LinkButton
            size="sm"
            variant="secondary"
            href="https://zenn.dev/mimifuwacc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Zenn"
          >
            <SiZenn /> Zenn
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}
