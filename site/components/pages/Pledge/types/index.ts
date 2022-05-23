import * as yup from "yup";

import { formSchema } from "../lib";

export type { putPledgeParams } from "../lib/putPledge";

export type Footprint = {
  timestamp: number;
  total: number;
};

export type Pledge = {
  id: string;
  ownerAddress: string;
  name: string;
  nonce: string;
  description: string;
  methodology: string;
  footprint: Footprint[];
  createdAt?: number;
  updatedAt?: number;
};

export type PledgeFormValues = yup.InferType<typeof formSchema>;