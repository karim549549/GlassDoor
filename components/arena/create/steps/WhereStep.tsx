"use client";

import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import type { ArenaFormInput } from "@/lib/arena/schema";
import { Field, LineInput, SegmentedChoice } from "../fields";

/**
 * Online or in a room, and where that room is.
 *
 * PRD 2 treats the offline mode as first-class - it is the reason the
 * Egypt-centric venue architecture exists - so this is a real choice between
 * two modes rather than an "add a venue" afterthought.
 *
 * The old section auto-"geocoded" the maps URL by string-splitting it and,
 * when that failed, silently wrote "Cairo Tech Innovation Hub, District 5"
 * into the venue name - a real-sounding address for a place the host never
 * chose. The venue is typed here instead; parsing a maps URL into a governorate
 * needs the geocoding service PRD 2 describes, not a `split("q=")`.
 */
export function WhereStep({
  register,
  errors,
  watch,
  setValue,
}: {
  register: UseFormRegister<ArenaFormInput>;
  errors: FieldErrors<ArenaFormInput>;
  watch: UseFormWatch<ArenaFormInput>;
  setValue: UseFormSetValue<ArenaFormInput>;
}) {
  const locationType = watch("locationType") ?? "ONLINE";
  const inPerson = locationType === "IN_PERSON";

  return (
    <div className="flex flex-col gap-10">
      <SegmentedChoice
        label="Where"
        name="location-type"
        value={locationType}
        onChange={(next) => {
          setValue("locationType", next, { shouldValidate: true });
          if (next === "ONLINE") {
            setValue("locationName", null);
            setValue("googleMapsUrl", null);
          }
        }}
        options={[
          { value: "ONLINE", label: "Online", detail: "Anyone, anywhere" },
          { value: "IN_PERSON", label: "In person", detail: "Everyone in one room" },
        ]}
      />

      {inPerson && (
        <div className="field-in flex flex-col gap-6 border-l-2 border-orange/40 pl-5">
          <Field
            label="Venue"
            hint="What you would tell someone on the phone"
            htmlFor="venue-name"
            error={errors.locationName?.message}
          >
            <LineInput
              id="venue-name"
              type="text"
              placeholder="Greek Campus, Downtown Cairo"
              invalid={Boolean(errors.locationName)}
              {...register("locationName")}
            />
          </Field>

          <Field
            label="Map link"
            hint="Optional"
            htmlFor="maps-url"
            error={errors.googleMapsUrl?.message}
          >
            <LineInput
              id="maps-url"
              type="url"
              inputMode="url"
              placeholder="https://maps.google.com/?q=..."
              invalid={Boolean(errors.googleMapsUrl)}
              {...register("googleMapsUrl")}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

export default WhereStep;
