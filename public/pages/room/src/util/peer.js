class PeerBuilder {
  constructor({ peerConfig }) {
    this.peerConfig = peerConfig;

    const defaultFunctionValue = () => {};
    this.onError = defaultFunctionValue;
    this.onCallRecieved = defaultFunctionValue;
    this.onConnectionIsOpened = defaultFunctionValue;
    this.onPeerStreamRecieved = defaultFunctionValue;
  }

  setOnError(fn) {
    this.onError = fn;

    return this;
  }

  setOnCallRecieved(fn) {
    this.onCallRecieved = fn;

    return this;
  }

  setOnConnectionIsOpened(fn) {
    this.onConnectionIsOpened = fn;

    return this;
  }

  setOnPeerStreamRecieved(fn) {
    this.onPeerStreamRecieved = fn;

    return this;
  }

  _prepareCallEvent(call) {
    call.on("stream", (stream) => this.onPeerStreamRecieved(call, stream));

    this.onCallRecieved(call);
  }

  build() {
    const peer = new Peer(this.peerConfig);

    peer.on("error", this.onError);
    peer.on("call", this._prepareCallEvent.bind(this));

    return new Promise((resolve) =>
      peer.on("open", (id) => {
        this.onConnectionIsOpened(peer);
        return resolve(peer);
      })
    );
  }
}

export { PeerBuilder };
