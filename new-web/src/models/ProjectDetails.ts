export default class ProjectDetails {
    name: string; 
    tags: string[] 

    constructor(name: string, tags: string[]) {
        this.name = name;
        this.tags = tags;
    }
}