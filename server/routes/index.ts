import authRouter from './authRouter'
import categoryRouter from './categoryRouter';
import province from './province';
import realEstateNewRouter from './realEstateNewRouter';
import realEstateRouter from './realEstateRouter';
import statisticRouter from './statisticRouter';
import upload from './upload';

const routes = {
    authRouter,
    categoryRouter,
    realEstateRouter,
    realEstateNewRouter,
    upload,
    province,
    statisticRouter
}

export default routes;