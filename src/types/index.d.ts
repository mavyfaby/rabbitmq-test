declare global {

  type ChatMessage = {
    id: string;
    username: string;
    text: string;
    createdAt: Date;
  };

}

export {}