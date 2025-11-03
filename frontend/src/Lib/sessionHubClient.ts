"use client";

import * as signalR from "@microsoft/signalr";

const createFilteredLogger = (minLevel: signalR.LogLevel) => {
  const levelToMethod: Record<signalR.LogLevel, (message?: unknown, ...optional: unknown[]) => void> = {
    [signalR.LogLevel.Trace]: console.debug,
    [signalR.LogLevel.Debug]: console.debug,
    [signalR.LogLevel.Information]: console.info,
    [signalR.LogLevel.Warning]: console.warn,
    [signalR.LogLevel.Error]: console.error,
    [signalR.LogLevel.Critical]: console.error,
    [signalR.LogLevel.None]: () => undefined,
  };

  return {
    log: (logLevel: signalR.LogLevel, message: string) => {
      if (logLevel < minLevel || logLevel === signalR.LogLevel.None) {
        return;
      }

      if (logLevel === signalR.LogLevel.Error && message.includes("stopped during negotiation")) {
        console.debug("SignalR connection canceled during navigation:", message);
        return;
      }

      levelToMethod[logLevel](message);
    },
  } satisfies signalR.ILogger;
};

export const createSessionConnection = (baseUrl: string, token: string) =>
  new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/hubs/session`, {
      accessTokenFactory: () => token,
      transport: signalR.HttpTransportType.WebSockets,
    })
  .configureLogging(createFilteredLogger(signalR.LogLevel.Warning))
    .withAutomaticReconnect()
    .build();