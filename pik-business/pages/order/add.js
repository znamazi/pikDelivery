import AddOrder from '../../components/orders/AddOrder'
import { connect } from 'react-redux'
import PermissionDenied from '../../components/partials/PermissionDenied'

const Add = (props) => {
  return props.business.businessExist &&
    props.business.businessExist.status === 'Active' ? (
    <AddOrder mode="add" />
  ) : (
    <PermissionDenied />
  )
}

export default connect((state) => ({
  business: state.business
}))(Add)
