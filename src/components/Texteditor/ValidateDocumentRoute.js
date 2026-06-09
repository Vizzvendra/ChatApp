// This will redirect document to a new doc if id is not valid
import { Navigate,useParams } from "react-router-dom"
import { v4 as uuidv4, validate as validateUuid } from "uuid";

function ValidateDocumentRoute({ children }) {
    const { id } = useParams();

    // Validate if the ID is a valid UUIDv4
    if (!validateUuid(id)) {
        const newId = uuidv4();
        return <Navigate to={`/documents/${newId}`} replace />;
    }

    return children;
}

export default ValidateDocumentRoute
