import { useApi } from '../ApiContext';

export const useGetNegocios = () => {
  const { get, post, put, delete: del } = useApi();
  const endpoint = 'negocios';

  const listarNegocios = async () => {
    return await get(endpoint);
  };
  const listarUnNegocio = async (id) => {
    return await get(`${endpoint}/${id}`);
  };

  const postNegocio = async (data) => {
    return await post(endpoint, data);
  };
   const buscarNegociosCercanos = async (lat,lng,radioKm) => {
    return await get(`${endpoint}/cercanos?lat=${lat}&lng=${lng}&radioKm=${radioKm}`);
  }
  /*
  const eliminarNegocio = async (id) => {
    return await del(`${endpoint}/${id}`);
  }; */
  return {
    listarNegocios,
    listarUnNegocio,
    postNegocio,
    buscarNegociosCercanos,
 /*    putNegocio,
    eliminarNegocio */
  };

  
}