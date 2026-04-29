import { useState } from 'react'
import CrowdForm from './components/CrowdForm'
import CrowdTable from './components/CrowdTable'
import PredictHistory from './components/PredictHistory';

function App() {
  const [refresh, setRefresh] = useState(false);

  const reload = () => setRefresh(!refresh);

  return (
    <div>
      <h1>Public Transport Crowd System</h1>
      <CrowdForm refresh={reload} />
      <CrowdTable key={refresh}/>
      <PredictHistory/>
    </div>
  )
}

export default App
