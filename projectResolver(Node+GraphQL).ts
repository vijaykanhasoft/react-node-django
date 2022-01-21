import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { connection } from "../connection";
import { CommonResponse, Projects, Customers } from "../entities";
import GraphQLJSON from "graphql-type-json";
import * as moment from 'moment'


@Resolver(ProjectResolver)
export class ProjectResolver {

    @Mutation(returns => Projects)
    async addProject(@Ctx() { req },
        @Arg("projectAlias") projectAlias: string,
        @Arg("projectName") projectName: string,
        @Arg("projectDescription", { nullable: true }) projectDescription: string,
        @Arg("tagCloud", returns => GraphQLJSON, { nullable: true }) tagCloud: object,
        @Arg("backgroundStimulusId", { nullable: true }) backgroundStimulusId: number,
        @Arg("iconStimulusId") iconStimulusId: number,
        @Arg("departmentId") departmentId: number,
        @Arg("projectOwnerId") projectOwnerId: number,
        @Arg("cascadedProjectId", { nullable: true }) cascadedProjectId: number,
        @Arg("cascadedProjectOrder", { nullable: true }) cascadedProjectOrder: number
    ) {
        let schemaname = (!!req.body.schemaname ? req.body.schemaname : req.headers.schemaname)
        //find customer id
        const masterConnection = await connection("public");
        const customerRepository = masterConnection.getRepository(Customers)
        let customerData = await customerRepository.findOne({ where: { customer_name: schemaname } })

        const tenantConnection = await connection(schemaname);
        const projectRepository = tenantConnection.getRepository(Projects);
        let projects = {
            projectAlias: projectAlias,
            projectName: projectName,
            projectDescription: projectDescription,
            tagCloud: tagCloud,
            backgroundStimulusId: backgroundStimulusId,
            iconStimulusId: iconStimulusId,
            departmentId: departmentId,
            projectOwnerId: projectOwnerId,
            cascadedProjectId: cascadedProjectId,
            cascadedProjectOrder: cascadedProjectOrder,
            customerId: customerData.customer_id
        }

        let response = await projectRepository.save(projects);

        return response;
    }

    @Mutation(returns => Projects)
    async updateProject(
        @Ctx() { user, req },
        @Arg("projectId") projectId: number,
        @Arg("projectAlias", { nullable: true }) projectAlias: string,
        @Arg("projectName", { nullable: true }) projectName: string,
        @Arg("projectDescription", { nullable: true }) projectDescription: string,
        @Arg("tagCloud", returns => GraphQLJSON, { nullable: true }) tagCloud: object,
        @Arg("backgroundStimulusId", { nullable: true }) backgroundStimulusId: number,
        @Arg("iconStimulusId", { nullable: true }) iconStimulusId: number,
        @Arg("departmentId", { nullable: true }) departmentId: number,
        @Arg("projectOwnerId", { nullable: true }) projectOwnerId: number,
        @Arg("cascadedProjectId", { nullable: true }) cascadedProjectId: number,
        @Arg("cascadedProjectOrder", { nullable: true }) cascadedProjectOrder: number) {

        const masterConnection = await connection(req.headers.schemaname);
        const sourceRepository = await masterConnection.getRepository(Projects);

        await sourceRepository.update({ "projectId": projectId }, {
            projectAlias: projectAlias,
            projectName: projectName,
            projectDescription: projectDescription,
            tagCloud: tagCloud,
            backgroundStimulusId: backgroundStimulusId,
            iconStimulusId: iconStimulusId,
            departmentId: departmentId,
            projectOwnerId: projectOwnerId,
            cascadedProjectId: cascadedProjectId,
            cascadedProjectOrder: cascadedProjectOrder,
            updatedAt: moment().utc().toISOString()
        })

        return await sourceRepository.findOne({ where: { "projectId": projectId } });

    }

    @Mutation(returns => CommonResponse)
    async disableProject(@Ctx() { user, req },
        @Arg("projectId") projectId: number) {

        const masterConnection = await connection(req.headers.schemaname);
        const sourceRepository = await masterConnection.getRepository(Projects);

        sourceRepository.update({ "projectId": projectId }, {
            active: false
        })

        let returnResult: CommonResponse<any> = {
            status: true,
            message: "Project Disabled.",
            messagecode: 200,
            data: null
        };
        return returnResult;

    }

    @Mutation(returns => CommonResponse)
    async activeProject(@Ctx() { user, req },
        @Arg("projectId") projectId: number) {

        const masterConnection = await connection(req.headers.schemaname);
        const sourceRepository = await masterConnection.getRepository(Projects);

        sourceRepository.update({ "projectId": projectId }, {
            active: true
        })

        let returnResult: CommonResponse<any> = {
            status: true,
            message: "Project Enabled.",
            messagecode: 200,
            data: null
        };
        return returnResult;

    }

    @Mutation(returns => CommonResponse)
    async deleteProject(@Ctx() { user, req },
        @Arg("projectId") projectId: number) {

        const masterConnection = await connection(req.headers.schemaname);
        const sourceRepository = await masterConnection.getRepository(Projects);

        sourceRepository.update({ "projectId": projectId }, {
            deleted: true
        })

        let returnResult: CommonResponse<any> = {
            status: true,
            message: "Project Deleted.",
            messagecode: 200,
            data: null
        };
        return returnResult;
    }

    @Query(returns => [Projects], { nullable: true })
    async viewProject(@Ctx() { user, req },
        @Arg("projectOwnerId") projectOwnerId: number): Promise<Projects[] | undefined> {
        try {
            const masterConnection = await connection(req.headers.schemaname);
            const sourceRepository = await masterConnection.getRepository(Projects);
            return await sourceRepository.find({ "active": true, "projectOwnerId": projectOwnerId });
        } catch (e) {
            throw new Error("Getting issue in fetch Project.");
        }
    }
}
