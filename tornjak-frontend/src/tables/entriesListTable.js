import React from "react";
import { connect } from 'react-redux';
import { DataTable } from "carbon-components-react";
import ResetIcon from "@carbon/icons-react/es/reset--alt/20";
import GetApiServerUri from 'components/helpers';
import IsManager from 'components/is_manager';
import axios from 'axios'
import {
    entriesListUpdate
} from 'actions';
const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader,
    TableSelectRow,
    TableSelectAll,
    TableToolbar,
    TableToolbarSearch,
    TableToolbarContent,
    TableBatchActions,
    TableBatchAction,
} = DataTable;

class DataTableRender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listData: props.data,
            listTableData: [{}]
        };
        this.prepareTableData = this.prepareTableData.bind(this);
    }

    componentDidMount() {
        //this.prepareTableData();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.setState({
                listData: this.props.globalentriesList
            })
            this.prepareTableData();
        }
    }

    prepareTableData() {
        const { data } = this.props;
        let listData = [...data];
        let listtabledata = [];
        let i = 0;
        for (i = 0; i < listData.length; i++) {
            listtabledata[i] = {};
            listtabledata[i]["id"] = listData[i].props.entry.id;
            listtabledata[i]["spiffeid"] = "spiffe://" + listData[i].props.entry.spiffe_id.trust_domain + listData[i].props.entry.spiffe_id.path;
            listtabledata[i]["parentid"] = "spiffe://" + listData[i].props.entry.parent_id.trust_domain + listData[i].props.entry.parent_id.path;
            listtabledata[i]["selectors"] = listData[i].props.entry.selectors.map(s => s.type + ":" + s.value).join(', ');
            listtabledata[i]["info"] = <div style={{ overflowX: 'auto', width: "400px" }}><pre>{JSON.stringify(listData[i].props.entry, null, ' ')}</pre></div>;
            // listtabledata[i]["actions"] = <div><a href="#" onClick={() => { listData[i].props.deleteEntry(listData[i].props.entry.id) }}>Delete</a></div>;
        }
        this.setState({
            listTableData: listtabledata
        })
    }

    deleteEntry(selectedRows) {
        var id = [], i = 0, endpoint = "";
        if (IsManager) {
            endpoint = GetApiServerUri('/manager-api/entry/delete') + "/" + this.props.globalServerSelected
        } else {
            endpoint = GetApiServerUri('/api/entry/delete')
        }
        if (selectedRows.length !== 0) 
        {
            for (i = 0; i < selectedRows.length; i++) 
            {
                id = selectedRows[i].id;
                axios.post(endpoint, {
                    "ids": [id]
                })
                    .then(res => {
                        console.log(res.data)
                        this.props.entriesListUpdate(this.props.globalentriesList.filter(el => el.id !== id))
                            .catch((error) => {
                                console.log(error);
                            })
                    })
            }
        } else {
            return ""
        }
        window.location.reload();
    }

    render() {
        const { listTableData } = this.state;
        const headerData = [
            {
                header: 'ID',
                key: 'id',
            },
            {
                header: 'SPIFFE ID',
                key: 'spiffeid',
            },
            {
                header: 'Parent ID',
                key: 'parentid',
            },
            {
                header: 'Selectors',
                key: 'selectors',
            },
            {
                header: 'Info',
                key: 'info',
            },
            // {
            //     header: 'Actions',
            //     key: 'actions',
            // },
        ];
        return (
            <DataTable
                isSortable
                rows={listTableData}
                headers={headerData}
                render={({
                    rows,
                    headers,
                    getHeaderProps,
                    getSelectionProps,
                    onInputChange,
                    getPaginationProps,
                    getBatchActionProps,
                    getTableContainerProps,
                    selectedRows,
                }) => (
                    <TableContainer
                        {...getTableContainerProps()}
                    >
                        <TableToolbar>
                            <TableToolbarContent>
                                <TableToolbarSearch onChange={(e) => onInputChange(e)} />
                            </TableToolbarContent>
                            <TableBatchActions
                                {...getBatchActionProps()}
                            >
                                <TableBatchAction
                                    renderIcon={ResetIcon}
                                    iconDescription="Delete"
                                    onClick={() => {
                                        this.deleteEntry(selectedRows);
                                    }}
                                >
                                    Delete
                                </TableBatchAction>
                            </TableBatchActions>
                        </TableToolbar>
                        <Table size="short" useZebraStyles>
                            <TableHead>
                                <TableRow>
                                    <TableSelectAll {...getSelectionProps()} />
                                    {headers.map((header) => (
                                        <TableHeader {...getHeaderProps({ header })}>
                                            {header.header}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableSelectRow {...getSelectionProps({ row })} />
                                        {row.cells.map((cell) => (
                                            <TableCell key={cell.id}>{cell.value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            />
        );
    }
}

const mapStateToProps = (state) => ({
    globalServerSelected: state.serverInfo.globalServerSelected,
    globalentriesList: state.serverInfo.globalentriesList
})

export default connect(
    mapStateToProps,
    { entriesListUpdate }
)(DataTableRender)
