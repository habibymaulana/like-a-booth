import {createHandler} from '../../server/delivery-handler.js';
import {adapters} from '../../server/delivery-adapters.js';
export default createHandler({env:process.env,...adapters(process.env)});
