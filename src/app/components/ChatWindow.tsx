import { db } from "@/db/db";
import { Avatar, List, Spin } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import "../globals.css";
import { chatProgressAtom } from "../store/chatState";
import { useAtom } from "jotai";
import hljs from "highlight.js";

export const ChatWindow: React.FC<{ dialogId: number }> = ({ dialogId }) => {
  const listRef = useRef(null);
  const [chatProgress] = useAtom(chatProgressAtom);

  const dialogMsgs = useLiveQuery(async () => {
    return db.messages.where("conversationId").equals(dialogId).toArray();
  });

  useLayoutEffect(() => {
    if (dialogMsgs && dialogMsgs.length > 0) {
      listRef.current;
      const lastMessageID = dialogMsgs[dialogMsgs.length - 1];
      const element = document.getElementById(
        `dialogcard-${String(lastMessageID.id)}`,
      );
      if (element) {
        element.scrollIntoView();
      } else {
        console.error("Element with id", lastMessageID, "not found!");
      }
    }
  }, [dialogMsgs]);
  useEffect(() => {
    const codeBlocks = document.querySelectorAll("pre code");

    codeBlocks.forEach((block) => {
      if (block instanceof HTMLElement) {
        hljs.highlightElement(block);
      }
    });
  }, [dialogMsgs]);

  if (!dialogMsgs) return <></>;

  const splittext = (content: string) => {
    const parts = content.split(/```/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const [language, ...codeLines] = part.split("\n");
        const code = codeLines.join("\n").trim();
        console.log(`Detect lang: ${language}, code: ${code}`);
        if (code) {
          return (
            <pre key={index}>
              <code className={`language-${language.trim()}`}>
                {code.trim()}
              </code>
            </pre>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  //ICONText will be used later when we add more functions to the chat items
  //const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  //  <Space>
  //    {React.createElement(icon)}
  //    {text}
  //  </Space>
  //);

  return (
    <List
      itemLayout="vertical"
      size="large"
      dataSource={dialogMsgs}
      renderItem={(item) => (
        <List.Item
          key={item.role}
          id={"dialogcard-" + String(item.id)}
          style={{ whiteSpace: "pre-wrap" }}
          // actions={[  //FOR LATER
          //   <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
          //   <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
          //   <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
          // ]}
        >
          <List.Item.Meta
            avatar={
              item.role === "user" ? (
                <Avatar
                  src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${dialogId}`}
                />
              ) : (
                <Avatar
                  src={
                    chatProgress?.isInProgress ? (
                      <Spin />
                    ) : (
                      `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${dialogId}`
                    )
                  }
                />
              )
            }
            title={
              item.role === "user"
                ? "Haplorhini"
                : `JMAC v${process.env.NEXT_PUBLIC_APP_VERSION}`
            }
            description="Placeholder for date and other things"
          />
          {splittext(item.content)}
        </List.Item>
      )}
    />
  );
};
