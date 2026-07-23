import { searchFoods } from './src/server/actions/calorie-api';

async function run() {
  process.env.CALORIE_API_KEY = 'fn_rhRwsNhDenXS-qWAesUU1VqZD_PKTpl_SFkG2WyvfqU';
  const result = await searchFoods('shawarma');
  console.log(JSON.stringify(result, null, 2));
}
run();
