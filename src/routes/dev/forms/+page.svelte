<script lang="ts">
  import {
    Checkbox,
    CheckboxGroup,
    Fieldset,
    FileInput,
    Form,
    FormControl,
    Input,
    Label,
    Radio,
    RadioGroup,
    Select,
    Textarea,
  } from "$lib/components/form";
  import { nanoid } from "nanoid";

  import Button from "$lib/components/ui/button/button.svelte";
  import { submitKitchenSink } from "./forms.remote";
  import {
    genres,
    instruments,
    kitchenSinkSchema,
    languages,
    operatingSystems,
  } from "./forms.schema";

  const demoForm = submitKitchenSink.for(nanoid()).preflight(kitchenSinkSchema);
  const { name, bio, instrument, subscribe, avatar, profile, tags } =
    demoForm.fields;
</script>

<div class="mx-auto w-full max-w-lg space-y-6 mb-12">
  <h1>Form components</h1>

  <Form form={demoForm} enctype="multipart/form-data" class="space-y-5">
    <FormControl>
      <Label>Name</Label>
      <Input field={name} description="How you'll appear on the schedule" />
    </FormControl>

    <FormControl>
      <Label>Bio</Label>
      <Textarea field={bio} rows={3} />
    </FormControl>

    <FormControl>
      <Label>Instrument</Label>
      <Select field={instrument}>
        <option value="">Choose one</option>
        {#each instruments as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </Select>
    </FormControl>

    <FormControl>
      <Label>Genres</Label>
      <Select
        field={demoForm.fields.genres}
        multiple
        description="Hold cmd to pick several"
      >
        {#each genres as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </Select>
    </FormControl>

    <CheckboxGroup field={demoForm.fields.languages} legend="Languages">
      {#each languages as option (option)}
        <Checkbox value={option}>{option.toUpperCase()}</Checkbox>
      {/each}
    </CheckboxGroup>

    <RadioGroup
      field={demoForm.fields.operatingSystem}
      legend="Operating system"
    >
      {#each operatingSystems as option (option)}
        <Radio value={option}>{option}</Radio>
      {/each}
    </RadioGroup>

    <Checkbox field={subscribe} description="We send one email a week, at most"
      >Subscribe to updates</Checkbox
    >

    <FormControl>
      <Label>Avatar</Label>
      <FileInput field={avatar} accept="image/*" />
    </FormControl>

    <Fieldset legend="Profile">
      <FormControl>
        <Label>Height (cm)</Label>
        <Input field={profile.height} type="number" min={1} />
      </FormControl>

      <FormControl>
        <Label>City</Label>
        <Input field={profile.city} />
      </FormControl>
    </Fieldset>

    <Fieldset
      legend="Tags"
      field={tags}
      description="Three slots, and they have to be distinct"
    >
      {#each [0, 1, 2] as index (index)}
        <Input field={tags[index]} aria-label="Tag {index + 1}" />
      {/each}
    </Fieldset>

    <Button type="submit" disabled={!!demoForm.pending}>
      {demoForm.pending ? "Submitting..." : "Submit"}
    </Button>
  </Form>

  {#if demoForm.result}
    <pre
      data-testid="result"
      class="overflow-x-auto rounded bg-neutral-100 p-3 text-xs">{JSON.stringify(
        demoForm.result,
        null,
        2,
      )}</pre>
  {/if}
</div>
