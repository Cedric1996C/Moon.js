/// <reference types="node" />
import * as Application from './src/calabash'
import { BaseContext, Request, Response } from 'koa';
import { decorator } from './src/decorator';
import CalabashCluster from './src/cluster';

interface FService { }
interface FController { }
interface FConfig { }

declare module "koa" {
  export interface BaseContext {
    service: FService;
    request: Request;
    response: Response
  }
}


export class Calabash extends Application.Calabash {
  controller: FController
  config: FConfig;
}



export class Controller extends Application.Calabash.Controller {
  app: Calabash;
}



export class Service extends Application.Calabash.Service {
  app: Calabash;
}

export class Cluster extends Application.Calabash.Cluster{

}

export const Decorator: decorator;

export as namespace Calabash;