<?php
namespace Zabbix\Service;

use Zabbix\Service\JSONRPCServiceAdapter;

/**
 * Wraps a GET call, which returns a list of objects.
 * 
 * This API call additionally supports emulated pagination
 * and overall record counting.
 */
class JSONRPCGetListCall extends JSONRPCServiceAdapter {
	/**
	 * Specifies the start of the output. 
	 * @var integer
	 */
	private $start = null;
	
	/**
	 * Specifies the limit of the output.
	 * @var integer
	 */
	private $limit = null;
	
	/**
	 * Sets the start of the pagination.
	 * 
	 * @param integer $start An integer which record to retrieve first, or null for the default (0)
	 */
	public function setStart ($start) {
		if ($start === null) {
			$this->start = null;
		} else {
			$this->start = intval($start);
		}
		
	}
	
	/**
	 * Returns the start of the list.
	 * 
	 * @return integer The numeric start, or null if not set.
	 */
	public function getStart () {
		return $this->start;
	}
	
	/**
	 * Sets the limit for the pagination.
	 * 
	 * @param int $limit The numeric limit of records, or null for unlimited.
	 */
	public function setLimit ($limit) {
		if ($limit === null) {
			$this->limit = null;
		} else {
			$this->limit = intval($limit);
		}
	}
	
	/**
	 * Returns the limit for the pagination.
	 * 
	 * @param int The numeric limit, or null if no limit is set 
	 */
	public function getLimit () {
		return $this->limit;
	}
	
	/**
	 * Executes a call against the Zabbix JSON-RPC API.
	 * 
	 * This method additionally applies emulated pagination to the result set, as well as
	 * adding the overall record count into the result array (total property is totalCount).
	 *
	 * @param none
	 * @return array an array with the result set
	 */
	public function call () {
		$result = parent::call();
		// Check if the result key exists. If not, return the result immediately
		if (!array_key_exists("result", $result)) {
			return $result;
		}
		
		// Check if the result key is an array. If not, return the result immediately
		if (!is_array($result["result"])) {
			return $result;
		}
		
		$result["totalCount"] = count($result["result"]); 
		
		$start = $this->getStart();
		$limit = $this->getLimit();
		
		if ($start === null) {
			$start = 0;
		}
		if ($limit === null) {
			$limit = $result["totalCount"];
		}
		
		$result["result"] = array_slice($result["result"], $start, $limit);
		
		foreach ($result["result"] as $key => $item) {
			if (is_array($item)) {
				foreach ($result["result"][$key] as $key2 => $item2) {
					if (is_array($item2)) {
						$result["result"][$key]["_".$key2."_count"] = count($item2);
					}
				}
			}
		}
		return $result;
	}
}