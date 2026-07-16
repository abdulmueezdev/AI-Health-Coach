# Goal

Implement Phase 7, Item 1: Supabase Storage Signed URLs for meal photos.

## Proposed Changes

We will break the implementation down into small, safe GSD Core chunks.

### Chunk 1: Server Actions Update
Update `src/server/actions/meals.ts`:
- Add `uploadMealPhoto(formData: FormData)` action to upload file to `meal-photos` bucket in Supabase Storage. Returns the storage path.
- Update `getMeals()` to iterate over meals and generate a signed URL (using `supabase.storage.from('meal-photos').createSignedUrl(meal.photo_url, 3600)`) for each meal that has a `photo_url`. It will inject the signed URL into the `meal` object returned to the frontend.

### Chunk 2: Frontend Integration for Meal Photo Upload
Update `src/app/meals/page.tsx`:
- Handle the `<input type="file" id="meal-photo" />` change event.
- Use `FormData` to pass the selected file to `uploadMealPhoto` server action.
- On success, pass the returned `path` as `photo_url` to `createMeal()`.
- Add an `Image` or `img` tag in the `Recent Meals` list to display the meal photo if `photo_url` is present.

### Chunk 3: Update `schema.sql` (if needed)
- Verify that `src/lib/supabase/schema.sql` properly allows users to upload, select, update, and delete their own files in the `meal-photos` bucket. The existing `using` policy may be sufficient, but we will ensure it's explicitly robust for `INSERT` if needed. (Skipped if already correct).

### Chunk 4: Compilation and Verification
- Run `npm run build` and `npx tsc --noEmit` to ensure TypeScript strict mode passes.
- Verify that all `user.id` checks and `.eq('user_id', user.id)` logic are maintained.

## Verification Plan
1. `npx tsc --noEmit`
2. `npm run build`
