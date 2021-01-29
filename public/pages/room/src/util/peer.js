class PeerBuilder {
  constructor({ peerConfig }) {
    this.peerConfig = peerConfig;

    const defaultFunctionValue = () => {};
    this.onError = defaultFunctionValue;
    this.onCallRecieved = defaultFunctionValue;
    this.onConnectionIsOpened = defaultFunctionValue;
    this.onPeerStreamRecieved = defaultFunctionValue;
    this.onCallError = defaultFunctionValue;
    this.onCallClose = defaultFunctionValue;
  }

  setOnCallError(fn) {
    this.onCallError = fn;

    return this;
  }

  setOnCallClose(fn) {
    this.onCallClose = fn;

    return this;
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
    call.on("error", (error) => this.onCallError(call, error));
    call.on("close", (_) => this.onCallClose(call));
    this.onCallRecieved(call);
  }

  _preparePeerInstanceFunction(PeerModule) {
    class PeerCustomModule extends PeerModule {}

    const peerCall = PeerCustomModule.prototype.call;

    const context = this;
    PeerCustomModule.prototype.call = function (id, stream) {
      const call = peerCall.apply(this, [id, stream]);

      context._prepareCallEvent(call);

      return call;
    };

    return PeerCustomModule;
  }

  build() {
    const PeerCustomInstance = this._preparePeerInstanceFunction(Peer);
    const peer = new PeerCustomInstance(this.peerConfig);

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
