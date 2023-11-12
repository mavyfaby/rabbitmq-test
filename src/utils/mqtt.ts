import Paho from "paho-mqtt";

type MQTTOptions = {
  host: string;
  username: string;
  port?: number;
  path?: string;
}

class MQTT {
  private options: MQTTOptions;
  private client: Paho.Client;

  /**
   * Initialize MQTT client
   * @author mavyfaby (Maverick Fabroa)
   */
  constructor(options: MQTTOptions) {
    this.options = options;
    this.client = new Paho.Client(
      this.options.host,
      this.options.port || 15675,
      this.options.path || "/ws",
      this.options.username
    );
  }

  /**
   * When the client connects to the broker
   * @param callback 
   */
  public onConnectionLost(callback: (error: Paho.MQTTError) => void) {
    this.client.onConnectionLost = callback;
  }

  /**
   * When the client successfully sends a message
   * @param callback 
   */
  public onMessageDelivered(callback: (message: Paho.Message) => void) {
    this.client.onMessageDelivered = callback;
  }

  /**
   * When the client receives a message
   * @param callback 
   */
  public onMessageArrived(callback: (username: string, message: Paho.Message) => void) {
    this.client.onMessageArrived = (message: Paho.Message) => {
      // Get topic and username from clientId
      const [_, username] = message.destinationName.split("/");

      // If the message is NOT from the same user, then call the callback
      if (username !== this.options.username) {
        callback(username, message);
      }
    };
  }

  /**
   * Subscribe for messages, request receipt of a copy of messages sent to the destinations described by the filter.
   * @param topic The topic to subscribe to
   * @param subcribeOptions Use to control the subscription
   */
  public subscribe(topic: string, subcribeOptions?: Paho.SubscribeOptions) {
    this.client.subscribe(`${topic}/#`, subcribeOptions);
  }

  /**
   * Send a message to the broker
   * @param topic The topic to send the message to
   * @param payload The message to send
   */
  public send(topic: string, payload: string) {
    const message = new Paho.Message(payload);
    message.destinationName = `${topic}/${this.options.username}`;
    this.client.send(message);
  }

  /**
   * Connect to the broker
   */
  public connect(callback: (error?: Paho.MQTTError) => void) {
    // Connect to the broker
    this.client.connect({
      // Success callback
      onSuccess: () => {
        callback();
      },
      // Failure callback
      onFailure: (error: Paho.MQTTError) => {
        callback(error);
      },
    });
  }

  /**
   * Check if the client is connected to the broker
   */
  public isConnected() {
    return this.client.isConnected();
  }

  /**
   * Get the username of the client
   * @returns The username of the client
   */
  public getUsername() {
    return this.options.username;
  }
}

export default MQTT;