export type ExtensionContext = {
    subscriptions: { dispose: () => any }[];
    extensionPath: string;
}

export const commands = {
    registerCommand: jest.fn()
}

export const window = {
    createWebviewPanel: jest.fn()
}

export enum ViewColumn {
    Active = -1,
    Beside = -2,
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9
}

export const Uri = {
    file: jest.fn()
}

export type WebviewPanel = {
    webview: {
        asWebviewUri: (localResource: any) => any
    }
}

export const Webview = {
    asWebviewUri: jest.fn()
}
