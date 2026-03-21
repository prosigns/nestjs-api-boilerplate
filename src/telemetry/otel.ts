import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

let sdk: NodeSDK | undefined;

/**
 * Starts OpenTelemetry when `OTEL_ENABLED=true`.
 * Configure exporters and service name via standard `OTEL_*` environment variables
 * (e.g. `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME`, `OTEL_TRACES_EXPORTER`).
 */
export function initTelemetry(): void {
  if (process.env.OTEL_ENABLED !== 'true') {
    return;
  }

  sdk = new NodeSDK({
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();

  const shutdown = () =>
    sdk?.shutdown().catch(() => undefined);

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
