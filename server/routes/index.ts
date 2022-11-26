import authRouter from './authRouter'
import categoryRouter from './categoryRouter';
import province from './province';
import realEstateNewRouter from './realEstateNewRouter';
import realEstateRouter from './realEstateRouter';
import upload from './upload';

const routes = {
    authRouter,
    categoryRouter,
    realEstateRouter,
    realEstateNewRouter,
    upload,
    province
}

export default routes;