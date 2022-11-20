#!/usr/bin/env node
import 'source-map-support/register.js';
import * as cdk from 'aws-cdk-lib';
import { SamTestStack } from '../lib/sam-test-stack.js';
import { SamBaseStack } from "../lib/sam-test-base-stack.js";

const app = new cdk.App();

const baseStack = new SamBaseStack(app, "SamTestBaseStack", {
  tags: {
    Owner: "ysuzuki",
  },
});

new SamTestStack(app, 'SamTestStack', {
  tags: {
    Owner: "ysuzuki",
  },
  baseStackName: baseStack.stackName,
});
