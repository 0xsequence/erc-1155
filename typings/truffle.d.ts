declare module 'truffle' {
  import * as truffle from 'truffle-contract'

  interface ArtifactsGlobal {
    require<A>(name: string): truffle.TruffleContract<A>
  }

  global {
    function contract(
      name: string,
      callback: (accounts: Array<string>) => void
    ): void;
    const artifacts: ArtifactsGlobal
  }
}
