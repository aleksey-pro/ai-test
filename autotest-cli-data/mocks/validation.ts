import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  graphFixtures,
  newsFixtures,
  pageFixtures,
  top10Fixtures,
} from './generated/fixtures';
import {
  assertGraphDatesAscending,
  assertGraphType,
  assertGraphTypeName,
  assertIsActiveString,
  assertIsinFormat,
  assertNewsDates,
  assertPagination,
  assertUrlFormat,
} from './business-rules';

const contractPath = path.resolve(process.cwd(), 'autotest-cli-data/contracts/swagger.json');

export function readCachedContract(): Record<string, unknown> {
  if (!existsSync(contractPath)) {
    throw new Error(
      `[MOCK] Cached OpenAPI contract is missing: ${contractPath}. ` +
        'Refresh the remote Swagger document before claiming schema validation.',
    );
  }

  const contract = JSON.parse(readFileSync(contractPath, 'utf8')) as Record<string, unknown>;
  if (!contract.paths || typeof contract.paths !== 'object') {
    throw new Error(`[MOCK] Cached OpenAPI contract has no paths object: ${contractPath}`);
  }
  return contract;
}

/**
 * Validate project-specific semantic rules now. OpenAPI response validation must
 * be added when a cached contract and a compatible validator are available.
 */
export function validateGeneratedFixtures(): void {
  for (const news of newsFixtures.success.data) {
    assertNewsDates(news);
    assertIsActiveString(news.is_active);
  }
  assertPagination(newsFixtures.success.meta);
  assertUrlFormat(pageFixtures.success.data.url);

  for (const graph of graphFixtures.success.data) {
    assertGraphTypeName(graph.type_name);
    assertGraphType(graph.graph_type);
    assertGraphDatesAscending(graph.primary.points);
  }

  for (const item of top10Fixtures.success.data) {
    assertIsinFormat(item.isin);
  }
}

export const cachedContractPath = contractPath;
