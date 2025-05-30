import { soapDataService } from '../Services/soap.data.service';

export const soapService = {
  SocioMetricService: {
    SocioMetricPort: {
      async getCrimeData(args: any, callback: any) {
        console.log('SOAP: getCrimeData args:', args);
        try {
          const records = await soapDataService.getCrimeData(args.token);
          callback({ records });
        } catch (e) {
          console.error('SOAP error:', e);
          throw {
            Fault: {
              faultcode: 'SOAP-ENV:Client',
              faultstring: 'Unauthorized'
            }
          };
        }
      },

      async getUnemploymentData(args: any, callback: any) {
        console.log('SOAP: getUnemploymentData args:', args);
        try {
          const records = await soapDataService.getUnemploymentData(args.token);
          callback({ records });
        } catch (e) {
          console.error('SOAP error:', e);
          throw {
            Fault: {
              faultcode: 'SOAP-ENV:Client',
              faultstring: 'Unauthorized'
            }
          };
        }
      },

      async getMergedData(args: any, callback: any) {
        console.log('SOAP: getMergedData args:', args);
        try {
          const records = await soapDataService.getMergedData(args.token);
          callback({ records });
        } catch (e) {
          console.error('SOAP error:', e);
          throw {
            Fault: {
              faultcode: 'SOAP-ENV:Client',
              faultstring: 'Unauthorized'
            }
          };
        }
      },
    }
  }
};
