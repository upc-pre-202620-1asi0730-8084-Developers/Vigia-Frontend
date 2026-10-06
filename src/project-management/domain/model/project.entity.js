import {PROJECT_STATUS} from "../project-status.js";

/**
 * Project entity (construction site) within the Project Management bounded context.
 * Its id is the site referenced by Dispatch.siteId in Order Management and Dispatch.
 *
 * @class Project
 */
export class Project {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Project identifier (e.g. OB-001).
     * @param {string} [params.name=''] - Project name.
     * @param {string} [params.zone=''] - Zone (PROJECT_ZONE).
     * @param {string} [params.city=''] - City where the site is located.
     * @param {?string} [params.managerId=null] - Site manager user id (IAM users).
     * @param {string} [params.managerName=''] - Site manager name, for display.
     * @param {number} [params.progress=0] - Physical progress percentage (0-100).
     * @param {number} [params.dispatchesCount=0] - Dispatches sent to the site.
     * @param {number} [params.receptionsCount=0] - Receptions recorded at the site.
     * @param {number} [params.incidentsCount=0] - Incidents reported at the site.
     * @param {string} [params.status=PROJECT_STATUS.IN_PROGRESS] - Project status.
     */
    constructor({ id = null, name = '', zone = '', city = '', managerId = null, managerName = '',
                  progress = 0, dispatchesCount = 0, receptionsCount = 0, incidentsCount = 0,
                  status = PROJECT_STATUS.IN_PROGRESS }) {
        this.id = id;
        this.name = name;
        this.zone = zone;
        this.city = city;
        this.managerId = managerId;
        this.managerName = managerName;
        this.progress = Math.min(100, Math.max(0, Number(progress) || 0));
        this.dispatchesCount = Number(dispatchesCount) || 0;
        this.receptionsCount = Number(receptionsCount) || 0;
        this.incidentsCount = Number(incidentsCount) || 0;
        this.status = status;
    }
}
