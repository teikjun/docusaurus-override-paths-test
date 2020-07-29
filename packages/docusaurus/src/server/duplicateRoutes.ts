/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chalk from 'chalk';
import {RouteConfig, OnDuplicateRoutes} from '@docusaurus/types';
import {getFinalRoutes} from '@docusaurus/utils';
import {flatMap} from 'lodash';

export function getAllDuplicateRoutes(
  pluginsRouteConfigs: RouteConfig[],
): string[] {
  const allRoutes: string[] = flatMap(pluginsRouteConfigs, getFinalRoutes).map(
    (routeConfig) => routeConfig.path,
  );
  const seenRoutes: Record<string, any> = {};
  const duplicateRoutes: string[] = allRoutes.filter(function (route) {
    if (seenRoutes.hasOwnProperty(route)) {
      return true;
    } else {
      seenRoutes[route] = true;
      return false;
    }
  });
  return duplicateRoutes;
}

export function getDuplicateRoutesMessage(
  allDuplicateRoutes: string[],
): string {
  const message = allDuplicateRoutes
    .map(
      (duplicateRoute) =>
        `Attempting to create page at ${duplicateRoute}, but a page already exists at this route`,
    )
    .join('\n');
  return message;
}

export function handleDuplicateRoutes(
  pluginsRouteConfigs: RouteConfig[],
  onDuplicateRoutes: OnDuplicateRoutes,
): void {
  if (onDuplicateRoutes === 'ignore') {
    return;
  }
  const duplicatePaths: string[] = getAllDuplicateRoutes(pluginsRouteConfigs);
  const message: string = getDuplicateRoutesMessage(duplicatePaths);
  if (message) {
    const finalMessage = `Duplicate routes found!\n${message}\nThis could lead to non-deterministic routing behavior`;
    if (onDuplicateRoutes === 'log') {
      console.log(chalk.blue(finalMessage));
    } else if (onDuplicateRoutes === 'warn') {
      console.warn(chalk.yellow(finalMessage));
    } else if (onDuplicateRoutes === 'throw') {
      throw new Error(finalMessage);
    } else {
      // should not reach here if validation is done correctly
      throw new Error(
        'unexpected onDuplicateRoutes value: ${onDuplicateRoutes}',
      );
    }
  }
}
