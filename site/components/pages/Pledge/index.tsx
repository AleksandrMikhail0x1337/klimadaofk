import React, { useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { Trans, t } from "@lingui/macro";
import { ButtonPrimary, Text } from "@klimadao/lib/components";
import { getIsDomainInURL } from "lib/getIsDomainInURL";

import { PageHead } from "components/PageHead";
import { PledgeLayout } from "./PledgeLayout";
import * as styles from "./styles";

export const Pledge: NextPage = () => {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState(false);

  const handleAddressInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAddress(event.currentTarget.value);
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSubmit();
  };

  const handleSubmit = () => {
    if (ethers.utils.isAddress(address) || getIsDomainInURL(address)) {
      router.push(`/pledge/${address}`);
    }

    setError(true);
  };

  return (
    <PledgeLayout>
      <PageHead
        title={t({
          id: "pledges.head.title",
          message: "KlimaDAO | Pledges",
        })}
        mediaTitle={t({
          id: "pledges.head.metaTitle",
          message:
            "Klima Infinity - Search for or start a pledge to the world today", // TODO - copy check
        })}
        metaDescription={t({
          id: "pledges.head.metaDescription",
          message:
            "Drive climate action and earn rewards with a carbon-backed digital currency.", // Need better meta description
        })}
      />
      <div className={styles.container}>
        <form className={styles.inputContainer} onSubmit={handleFormSubmit}>
          <input
            className={styles.input}
            placeholder={t({
              id: "pledges.home.search.placeholder",
              message: "Enter a wallet address, .klima or .eth domain",
            })}
            value={address}
            data-error={error}
            onChange={handleAddressInputChange}
          />

          {error && (
            <Text className={styles.errorMessage} t="caption">
              <Trans id="pledges.home.search.error_message">
                Enter a wallet address, .klima or .eth domain
              </Trans>
            </Text>
          )}

          <ButtonPrimary label="Search" onClick={handleSubmit} />
        </form>
      </div>
    </PledgeLayout>
  );
};
