import React, { FC, useState } from "react";
import { Trans, t } from "@lingui/macro";
import { useRouter } from "next/router";
import { ButtonPrimary, Text } from "@klimadao/lib/components";
import ClearIcon from "@mui/icons-material/Clear";
import { trimWithLocale, useWeb3 } from "@klimadao/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useForm,
  useFieldArray,
  useWatch,
  Control,
  SubmitHandler,
} from "react-hook-form";

import { InputField, TextareaField } from "components/Form";

import {
  editPledgeSignature,
  formSchema,
  pledgeErrorTranslationsMap,
  PledgeErrorId,
  putPledge,
  pledgeFormAdapter,
} from "../lib";
import { Pledge, PledgeFormValues } from "../types";
import * as styles from "./styles";

type TotalFootprintProps = {
  control: Control<PledgeFormValues>;
  setValue: (field: "footprint", value: number) => void;
};

const TotalFootprint = ({ control, setValue }: TotalFootprintProps) => {
  const { locale } = useRouter();
  const categories = useWatch({ name: "categories", control });

  const totalFootprint: number = categories.reduce(
    (acc, current) => Number(acc) + Number(current.quantity || 0),
    0
  );
  setValue("footprint", totalFootprint);

  return (
    <Text t="h4">
      <Trans id="pledges.form.total_footprint_summary">
        Total Footprint: {trimWithLocale(totalFootprint, 2, locale)} Carbon
        Tonnes
      </Trans>
    </Text>
  );
};

type Props = {
  pageAddress: string;
  pledge: Pledge;
  onFormSubmit: (data: Pledge) => void;
};

export const PledgeForm: FC<Props> = (props) => {
  const [serverError, setServerError] = useState(false);
  const { signer } = useWeb3();
  const { control, register, handleSubmit, formState, reset, setValue } =
    useForm<PledgeFormValues>({
      mode: "onChange",
      defaultValues: pledgeFormAdapter(props.pledge),
      resolver: yupResolver(formSchema),
    });
  const { isDirty } = formState;

  const { fields, append, remove } = useFieldArray({
    name: "categories",
    control,
  });

  const onSubmit: SubmitHandler<PledgeFormValues> = async (
    values: PledgeFormValues
  ) => {
    try {
      if (!signer) return;
      const signature = await signer.signMessage(
        editPledgeSignature(values.nonce)
      );

      const response = await putPledge({
        pageAddress: props.pageAddress,
        pledge: values,
        signature,
      });
      const data = await response.json();

      if (data.pledge) {
        props.onFormSubmit(data.pledge);
        reset(pledgeFormAdapter(data.pledge));
        setServerError(false);
      } else {
        setServerError(true);
      }
    } catch (error) {
      console.log(error);
      setServerError(true);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit(onSubmit)}>
      {serverError && (
        <Text className={styles.errorMessage} t="caption">
          <Trans id="pledges.form.generic_error">
            Something went wrong. Please try again.
          </Trans>
        </Text>
      )}

      <InputField
        inputProps={{
          id: "name",
          placeholder: t({
            id: "pledges.form.input.name.placeholder",
            message: "Name or company name",
          }),
          type: "text",
          ...register("name"),
        }}
        label={t({ id: "pledges.form.input.name.label", message: "Name" })}
        errorMessage={
          !!formState.errors.name?.message &&
          pledgeErrorTranslationsMap[
            formState.errors.name.message as PledgeErrorId
          ]
        }
      />

      <InputField
        inputProps={{
          id: "profileImageUrl",
          placeholder: "https://",
          type: "text",
          ...register("profileImageUrl"),
        }}
        label={t({
          id: "pledges.form.input.profileImageUrl.label",
          message: "Profile image url (optional)",
        })}
        errorMessage={
          !!formState.errors.profileImageUrl?.message &&
          pledgeErrorTranslationsMap[
            formState.errors.profileImageUrl.message as PledgeErrorId
          ]
        }
      />

      <TextareaField
        textareaProps={{
          id: "pledge",
          placeholder: t({
            id: "pledges.form.input.description.placeholder",
            message: "What is your pledge?",
          }),
          rows: 2,
          ...register("description"),
        }}
        label={t({
          id: "pledges.form.input.description.label",
          message: "Pledge",
        })}
        errorMessage={
          !!formState.errors.description?.message &&
          pledgeErrorTranslationsMap[
            formState.errors.description.message as PledgeErrorId
          ]
        }
      />

      <TextareaField
        textareaProps={{
          id: "methodology",
          placeholder: t({
            id: "pledges.form.input.methodology.placeholder",
            message:
              "What tools or methodologies did you use to calculate your carbon footprint?",
          }),
          rows: 6,
          ...register("methodology"),
        }}
        label={t({
          id: "pledges.form.input.methodology.label",
          message: "Methodology",
        })}
        errorMessage={
          !!formState.errors.methodology?.message &&
          pledgeErrorTranslationsMap[
            formState.errors.methodology.message as PledgeErrorId
          ]
        }
      />

      <div className={styles.categories_section}>
        <Text t="caption">
          <Trans id="pledges.form.footprint.label">Footprint</Trans>
        </Text>

        {fields.length === 0 && (
          <Text t="caption" style={{ textAlign: "center", marginTop: "1rem" }}>
            <Trans id="pledges.form.footprint.prompt">
              Add a category and start calculating your carbon footprint
            </Trans>
          </Text>
        )}

        <div className={styles.categories}>
          {fields.map((field, index) => (
            <div className={styles.categoryRow} key={field.id}>
              <div className={styles.categoryRow_inputs}>
                <InputField
                  inputProps={{
                    placeholder: t({
                      id: "pledges.form.input.categoryName.placeholder",
                      message: "Category name",
                    }),
                    type: "text",
                    ...register(`categories.${index}.name` as const),
                  }}
                  hideLabel
                  label={t({
                    id: "pledges.form.input.categoryName.label",
                    message: "Category",
                  })}
                  errorMessage={
                    !!formState.errors?.categories?.[index]?.name?.message &&
                    pledgeErrorTranslationsMap[
                      formState?.errors?.categories?.[index]?.name
                        ?.message as PledgeErrorId
                    ]
                  }
                />

                <InputField
                  inputProps={{
                    placeholder: t({
                      id: "pledges.form.input.categoryQuantity.placeholder",
                      message: "Carbon tonnes",
                    }),
                    type: "number",
                    ...register(`categories.${index}.quantity` as const),
                  }}
                  hideLabel
                  label={t({
                    id: "pledges.form.input.categoryQuantity.label",
                    message: "Quantity",
                  })}
                  errorMessage={
                    !!formState.errors?.categories?.[index]?.quantity
                      ?.message &&
                    pledgeErrorTranslationsMap[
                      formState?.errors?.categories?.[index]?.quantity
                        ?.message as PledgeErrorId
                    ]
                  }
                />
              </div>

              <ButtonPrimary
                variant="icon"
                className={styles.categoryRow_removeButton}
                label={<ClearIcon fontSize="large" />}
                onClick={() => remove(index)}
              />
            </div>
          ))}
        </div>

        {fields.length < 10 && (
          <div className={styles.categories_appendRow}>
            <ButtonPrimary
              className={styles.categories_appendButton}
              variant="gray"
              label={t({
                id: "pledges.form.add_footprint_category_button",
                message: "Add category",
              })}
              onClick={() => append({ name: "", quantity: 0 })}
            />
          </div>
        )}
      </div>

      <InputField
        inputProps={{
          type: "hidden",
          ...register("footprint"),
        }}
        hideLabel
        label={t({
          id: "pledges.form.input.totalFootprint.label",
          message: "Total footprint",
        })}
        errorMessage={
          !!formState.errors.footprint?.message &&
          pledgeErrorTranslationsMap[
            formState.errors.footprint.message as PledgeErrorId
          ]
        }
      />

      <TotalFootprint control={control} setValue={setValue} />

      {/* better to use an input type=submit */}
      <ButtonPrimary
        disabled={!isDirty}
        label={t({
          id: "pledges.form.submit_button",
          message: "Save pledge",
        })}
        onClick={handleSubmit(onSubmit)}
      />
    </form>
  );
};
