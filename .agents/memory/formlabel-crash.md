---
name: FormLabel outside FormField crashes
description: shadcn/ui FormLabel throws if used outside a FormField context
---

shadcn's `<FormLabel>` internally calls `useFormField()` which reads from a React context set by `<FormField>`. If you use `<FormLabel>` anywhere outside a `<FormField>` wrapper (e.g. as a section heading for amenities, photo upload, map), it throws:

> useFormField should be used within <FormField>

**Fix:** Replace standalone `<FormLabel>` elements with plain `<label className="text-sm font-medium leading-none">`.

**Why:** This only affects cases where a label is decorative/structural rather than tied to a form field's validation state.

**How to apply:** Any time you add a label in a form that is NOT inside a FormField, use a plain <label> tag.
