class Api {
    public static getProjectData = async (): Promise<JSON> => {
        let json = async (): Promise<JSON> => { 
            let response = await fetch(`https://mocki.io/v1/e0cfdde9-e11c-4a20-b289-b22444101621`);
            let json = await response.json();
            return json;
        }
        return await json();
    }
}

export default Api;