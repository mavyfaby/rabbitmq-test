declare global {

  type ChatMessage = {
    text: string;
    username: string;
    createdAt: Date;
  };

}

export {}